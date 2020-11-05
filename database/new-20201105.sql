START TRANSACTION;

ALTER TABLE summary_measurements
    ADD COLUMN month INTEGER NOT NULL
    DEFAULT 12;

ALTER TABLE summary_measurements
    MODIFY COLUMN month INTEGER NOT NULL;

ALTER TABLE summary_measurements
    ADD COLUMN crawl_date TIMESTAMP NOT NULL
    DEFAULT '2020-01-01';

ALTER TABLE summary_measurements
    MODIFY COLUMN crawl_date TIMESTAMP NOT NULL;

ALTER TABLE summary_measurements
    ADD COLUMN source VARCHAR(255) NOT NULL
    DEFAULT 'url:table:censorship.measurements';

ALTER TABLE summary_measurements
    MODIFY COLUMN source VARCHAR(255) NOT NULL;

ALTER TABLE summary_measurements
    DROP PRIMARY KEY,
    ADD PRIMARY KEY(year, month, input, probe_cc, probe_asn);

COMMIT;