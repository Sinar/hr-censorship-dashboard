START TRANSACTION;

CREATE TABLE sites (
    import_date TIMESTAMP NOT NULL,
    country_code VARCHAR(5) NOT NULL,
    url VARCHAR(300) NOT NULL,
    category_code VARCHAR(255) NOT NULL,
    category_description TEXT,
    date_added TIMESTAMP NOT NULL DEFAULT NOW(),
    source VARCHAR(255) NOT NULL,
    notes TEXT,
    PRIMARY KEY(import_date, country_code, url)
)
ENGINE = InnoDB;

CREATE TABLE measurements (
    measurement_id VARCHAR(255) NOT NULL,
    anomaly BOOLEAN NOT NULL,
    confirmed BOOLEAN NOT NULL,
    failure BOOLEAN NOT NULL,
    input VARCHAR(300) NOT NULL NOT NULL,
    measurement_start_time TIMESTAMP NOT NULL,
    measurement_url TEXT NOT NULL,
    probe_asn VARCHAR(255) NOT NULL,
    probe_cc VARCHAR(5) NOT NULL,
    report_id VARCHAR(255) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    PRIMARY KEY(measurement_id)
)
ENGINE = InnoDB;

COMMIT;