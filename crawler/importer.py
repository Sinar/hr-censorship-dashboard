from datetime import datetime
import os, os.path
import csv

from odo import odo, drop
import dask.dataframe as df


def import_test_lists():
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
        odo(
            [row for row in csv.DictReader(f, skipinitialspace=True)],
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
                    autonomous_system_number: string,
                    autonomous_system_organization: string
                }
            """,
            local="LOCAL",
        )


def main():
    if os.environ.get("IMPORT_TYPE", "TEST_LIST"):
        import_test_lists()
    else:
        import_asn()


if __name__ == "__main__":
    main()
