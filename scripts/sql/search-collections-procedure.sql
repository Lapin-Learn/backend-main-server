CREATE OR REPLACE FUNCTION get_filtered_collections(
    p_offset INT,
    p_limit INT,
    p_keyword TEXT
) RETURNS TABLE (
    id INT,
    name varchar,
    tags TEXT[],
    description TEXT,
    test_count INT,
    top_tests JSONB,
    thumbnail JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH ranked_collections AS (
        SELECT
            c.id AS collection_id,
            CASE
                WHEN p_keyword IS NOT NULL AND p_keyword <> ''
                THEN ts_rank(c.keyword, to_tsquery(p_keyword || ':*'))
                ELSE NULL
            END AS rank
        FROM test_collections c
        WHERE
            (p_keyword IS NULL OR p_keyword = '' OR c.keyword @@ to_tsquery(p_keyword || ':*'))
        ORDER BY
            CASE
                WHEN p_keyword IS NOT NULL AND p_keyword <> ''
                THEN ts_rank(c.keyword, to_tsquery(p_keyword || ':*'))
                ELSE NULL
            END DESC
        OFFSET p_offset
        LIMIT p_limit
    ),
    limited_tests AS (
        SELECT
            t.collection_id AS collection_id,
            JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'id', t.id,
                    'order', t.order,
                    'test_name', t.test_name
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
        WHERE t.row_num <= 4
        GROUP BY t.collection_id
    )
    SELECT
        c.id,
        c.name,
        string_to_array(c.tags, ',') AS tags,
        c.description::text AS description,
        COUNT(t.id)::integer AS test_count,
        COALESCE(
            (SELECT lt.limited_top_tests FROM limited_tests lt WHERE lt.collection_id = c.id),
            '[]'::JSONB
        ) AS top_tests,
        JSONB_BUILD_OBJECT(
            'id', th.id
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
END;
$$ LANGUAGE plpgsql;

