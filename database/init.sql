BEGIN;

CREATE TABLE category (
    category_id CHARACTER,
    description TEXT,
    PRIMARY KEY(category_id)
);

CREATE TABLE sites (
    country_code CHARACTER,
    site_url CHARACTER,
    category_id CHARACTER,
    date_added TIMESTAMP WTIH TIME ZONE,
    source CHARACTER,
    notes TEXT,
    PRIMARY KEY(country_code, site_url)
);

CREATE TABLE measurements (
    measurement_id CHARACTER,
    anomaly BOOLEAN,
    confirmed BOOLEAN,
    failure BOOLEAN,
    site_url CHARACTER,
    start_time TIMESTAMP WITH TIME ZONE,
    measurement_url CHARACTER,
    probe_asn CHARACTER,
    probe_cc CHARACTER,
    report_id CHARACTER,
    test_name CHARACTER,
    PRIMARY KEY(measurement_id)
);

END;