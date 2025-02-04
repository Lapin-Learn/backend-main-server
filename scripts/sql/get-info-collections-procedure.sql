CREATE OR REPLACE FUNCTION get_filtered_collections(
    p_offset INT,
    p_limit INT,
    p_learner_profile_id UUID
) RETURNS TABLE (
    id INT,
    name varchar,
    tags TEXT[],
    description TEXT,
    "testCount" INT,
    "simulatedIeltsTests" JSONB,
    thumbnail JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH ranked_collections AS (
        SELECT
            c.id AS collection_id
        FROM test_collections c
        ORDER BY c.id
        OFFSET p_offset
        LIMIT p_limit
    ),
    latest_sessions AS (
        SELECT DISTINCT ON (sts.skill_test_id)
            sts.skill_test_id,
            sts.estimated_band_score AS band_score,
            sts.created_at
        FROM skill_test_sessions sts
        WHERE sts.learner_profile_id = p_learner_profile_id
        AND sts.mode = 'full_test'
        ORDER BY sts.skill_test_id, sts.created_at DESC
    ),
    skill_band_scores AS (
        SELECT
            st.id test_id,
            CASE
                WHEN COUNT(t.id) = 0 THEN 'not_started'
                WHEN COUNT(t.id) = COUNT(ls.skill_test_id)
                     AND COUNT(NULLIF(ls.band_score, NULL)) = COUNT(ls.skill_test_id)
                THEN 'done'
                ELSE 'in_progress'
            END AS status,
            CASE
                WHEN COUNT(t.id) = COUNT(ls.skill_test_id) AND COUNT(NULLIF(ls.band_score, NULL)) = COUNT(ls.skill_test_id)
                THEN ROUND(AVG(ls.band_score) * 2) / 2
            END AS estimated_band_score
        FROM simulated_ielts_tests st
        LEFT JOIN skill_tests t ON st.id = t.test_id
        LEFT JOIN latest_sessions ls ON t.id = ls.skill_test_id
        GROUP BY st.id
    ),
    limited_tests AS (
        SELECT
            t.collection_id AS collection_id,
            JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'id', t.id,
                    'order', t.order,
                    'testName', t.test_name,
                    'estimatedBandScore',sbs.estimated_band_score,
                    'status', sbs.status
                )
                ORDER BY t.order
            ) FILTER (WHERE t.row_num <= 4) AS limited_top_tests
        FROM (
            SELECT
                t.*,
                ROW_NUMBER() OVER (PARTITION BY t.collection_id ORDER BY t.order) AS row_num
            FROM simulated_ielts_tests t
            WHERE t.collection_id IN (SELECT collection_id FROM ranked_collections)
        ) t
        LEFT JOIN skill_band_scores sbs ON sbs.test_id = t.id
        WHERE t.row_num <= 4
        GROUP BY t.collection_id
    )
    SELECT
        c.id,
        c.name,
        string_to_array(c.tags, ',') AS tags,
        c.description::text AS description,
        COUNT(t.id)::integer AS "testCount",
        (SELECT lt.limited_top_tests FROM limited_tests lt WHERE lt.collection_id = c.id) AS "simulatedIeltsTests",
        JSONB_BUILD_OBJECT(
            'id', th.id,
            'name', th.name
        ) AS thumbnail
    FROM
        ranked_collections rc
        INNER JOIN test_collections c ON c.id = rc.collection_id
        LEFT JOIN simulated_ielts_tests t ON c.id = t.collection_id
        LEFT JOIN buckets th ON c.thumbnail_id = th.id
    GROUP BY
        c.id, th.id, c.tags, c.description
    ORDER BY
        MIN(t."order") NULLS LAST;
END
$$ LANGUAGE plpgsql;
