import argparse
from datetime import datetime
import sqlalchemy as sa
import os, os.path

from odo import odo
import dask.dataframe as df

def main():
    parser = argparse.ArgumentParser(description='Short sample app')
    parser.parser.add_argument('file')
    args.parser.parse_args()

    frame = df.read_csv(args.file)
    frame['country_code'] = os.path.basename(args.file)
    frame['import_date'] = datetime.now()

    odo(
        frame.compute().fillna(''),
        'mysql+pymysql://{}:{}@{}:{}/censorship::sites'.format(
            os.environ.get('DB_USER', 'root'),
            os.environ.get('DB_PASS', 'abc123'),
            os.environ.get('DB_HOST', 'localhost'),
            os.environ.get('DB_PORT', '3306')),
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
               """)

if __name__ == '__main__':
    main()