from datetime import datetime
import os, os.path
import csv

from odo import odo, drop
import dask.dataframe as df
import pymysql

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def import_test_lists():
    logging.info("Importing test-lists")
    _file = os.environ.get("IMPORT_FILE", "test-lists/lists/my.csv")
    frame = df.read_csv(_file)
    frame["country_code"] = os.path.splitext(os.path.basename(_file))[0].upper()
    frame["import_date"] = datetime.now()

    odo(
        frame.compute().fillna(""),
        "mysql+pymysql://{}:{}@{}:{}/{}::sites".format(
            os.environ.get("DB_USER", "root"),
            os.environ.get("DB_PASS", "abc123"),
            os.environ.get("DB_HOST", "localhost"),
            os.environ.get("DB_PORT", "3306"),
            os.environ.get("DB_NAME", "censorship"),
        ),
        dshape="""
               var * {
                   url: string,
                   category_code: string,
                   category_description: ?string,
                   date_added: string,
                   source: string,
                   notes: ?string,
                   country_code: string,
                   import_date: datetime,
               }
               """,
    )


def import_asn():
    try:
        logging.info("Dropping old asn-lists if exists")
        drop(
            "mysql+pymysql://{}:{}@{}:{}/{}::asn".format(
                os.environ.get("DB_USER", "root"),
                os.environ.get("DB_PASS", "abc123"),
                os.environ.get("DB_HOST", "localhost"),
                os.environ.get("DB_PORT", "3306"),
                os.environ.get("DB_NAME", "censorship"),
            )
        )
    except ValueError:
        pass

    with open(
        os.environ.get("IMPORT_FILE", "geoip-list/GeoLite2-ASN-Blocks-IPv4.csv")
    ) as f:
        logging.info("Importing asn-lists")
        odo(
            [dict(row, autonomous_system_number=f'AS{row["autonomous_system_number"]}')
             for row
             in csv.DictReader(f, skipinitialspace=True)],
            "mysql+pymysql://{}:{}@{}:{}/{}::asn".format(
                os.environ.get("DB_USER", "root"),
                os.environ.get("DB_PASS", "abc123"),
                os.environ.get("DB_HOST", "localhost"),
                os.environ.get("DB_PORT", "3306"),
                os.environ.get("DB_NAME", "censorship"),
            ),
            dshape="""
                var * {
                    network: string,
                    autonomous_system_number: string[8],
                    autonomous_system_organization: string
                }
            """,
            local="LOCAL",
        )

    logging.info("Building index for asn-lists")
    _conn = pymysql.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        port=int(os.environ.get("DB_PORT", 3306)),
        user=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASS", "abc123"),
        db=os.environ.get("DB_NAME", "censorship"))
    with _conn.cursor() as cur:
        cur.execute('''
                    CREATE INDEX asn_idx_autonomous_system_number ON asn(autonomous_system_number);
                    ''')


def main():
    if os.environ.get("IMPORT_TYPE", "TEST_LIST") == "ASN":
        import_asn()
    else:
        import_test_lists()


if __name__ == "__main__":
    main()
