create or replace function get_collections_by_keyword (
    p_keyword TEXT
) returns table(
    id int,
    name varchar,
    tags text[]
) as $$
begin
    return query
    SELECT
        c.id,
        c.name,
        string_to_array(c.tags, ',') AS tags
    FROM test_collections c
    WHERE
        (p_keyword IS NULL OR p_keyword = '' OR c.keyword @@ to_tsquery(p_keyword || ':*'))
    ORDER BY
        CASE
            WHEN p_keyword IS NOT NULL AND p_keyword <> ''
            THEN ts_rank(c.keyword, to_tsquery(p_keyword || ':*'))
            ELSE 0
        END DESC;
end
$$ language plpgsql;
