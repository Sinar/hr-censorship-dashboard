import os
import csv

from odo import odo, drop


def main():
    try:
        drop('mysql+pymysql://{}:{}@{}:{}/{}::asn'.format(
            os.environ.get('DB_USER', 'root'),
            os.environ.get('DB_PASS', 'abc123'),
            os.environ.get('DB_HOST', 'localhost'),
            os.environ.get('DB_PORT', '3306'),
            os.environ.get('DB_NAME', 'censorship')))
    except ValueError:
        pass

    with open(
            os.environ.get('IMPORT_FILE',
                           'geoip-list/GeoLite2-ASN-Blocks-IPv4.csv')) as f:
        odo([row for row in csv.DictReader(f, skipinitialspace=True)],
            'mysql+pymysql://{}:{}@{}:{}/{}::asn'.format(
                os.environ.get('DB_USER', 'root'),
                os.environ.get('DB_PASS', 'abc123'),
                os.environ.get('DB_HOST', 'localhost'),
                os.environ.get('DB_PORT', '3306'),
                os.environ.get('DB_NAME', 'censorship')),
            dshape="""
                var * {
                    network: string,
                    autonomous_system_number: string,
                    autonomous_system_organization: string
                }
            """,
            local='LOCAL')


if __name__ == '__main__':
    main()