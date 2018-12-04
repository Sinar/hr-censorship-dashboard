BEGIN;

CREATE TABLE summary_view (
    year            INTEGER NOT NULL,
    country         VARCHAR(5) NOT NULL,
    category        VARCHAR(255) NOT NULL,
    count           INTEGER NOT NULL,
    PRIMARY KEY(year, country, category)
)
ENGINE = InnoDB;

-- initialize table
--INSERT INTO summary_view(year, country, category, count)
--    SELECT      YEAR(measurement_start_time) AS year,
--                m.probe_cc AS country,
--                s.category_code AS category,
--                COUNT(DISTINCT m.input) AS count
--    FROM        measurements m
--    JOIN        sites s
--    ON          (m.input = s.url
--                    AND m.probe_cc = s.country_code)
--    WHERE       YEAR(measurement_start_time) IN (2017, 2018)
--                AND (anomaly = TRUE OR confirmed = TRUE)
--    GROUP BY    YEAR(measurement_start_time), m.probe_cc, s.category_code;

END;