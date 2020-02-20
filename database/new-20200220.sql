BEGIN;

ALTER TABLE sites MODIFY country_code VARCHAR(10) NOT NULL;

CREATE TABLE isp (
    country_code    VARCHAR(10) NOT NULL,
    isp             VARCHAR(255) NOT NULL,
    asn             VARCHAR(255) NOT NULL,
    PRIMARY KEY(country_code, isp, asn)
)
ENGINE = InnoDB;

INSERT INTO isp (country_code, isp, asn)
    SELECT      DISTINCT m.probe_cc, COALESCE(a.autonomous_system_organization, 'unknown'), m.probe_asn
    FROM        measurements m
    LEFT JOIN   asn a
    ON          a.autonomous_system_number = m.probe_asn;

END;