START TRANSACTION;

CREATE TABLE summary_measurements (
    year                INTEGER NOT NULL,
    input               VARCHAR(300) NOT NULL,
    probe_cc            VARCHAR(5) NOT NULL,
    probe_asn           VARCHAR(255) NOT NULL,
    anomaly_count       INTEGER NOT NULL,
    confirmed_count     INTEGER NOT NULL,
    failure_count       INTEGER NOT NULL,
    measurement_count   INTEGER NOT NULL,
    PRIMARY KEY(year, input, probe_asn)
)
ENGINE = InnoDB;

COMMIT;