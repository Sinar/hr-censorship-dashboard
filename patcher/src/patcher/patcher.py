from datetime import datetime

import os

import dateutil.parser
import pymysql.cursors
import pymysql
import ujson

FIELDS = ('anomaly', 'confirmed', 'failure', 'input', 'measurement_id',
          'measurement_start_time', 'measurement_url', 'probe_asn', 'probe_cc',
          'report_id', 'test_name')


def main():
    conn = pymysql.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        port=int(os.environ.get('DB_PORT', 3306)),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASS', 'abc123'),
        db=os.environ.get('DB_NAME', 'censorship'),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True)

    with open(os.environ.get('IMPORT_FILE', 'data.jsonl'), 'r') as _file, \
            conn.cursor() as _insert_cursor:

        for count, line in enumerate(map(ujson.loads, _file)):
            if count % 1000 == 0:
                print('Inserting line {}'.format(count + 1), flush=True)

            if line['measurement_start_time'] and line['input'] and len(
                    line['input']) <= 150:
                _insert_cursor.execute(
                    '''
                    REPLACE
                    INTO     measurements({})
                    VALUES   ({})
                    '''.format(', '.join(FIELDS),
                               ', '.join('%s' for _ in range(len(FIELDS)))),
                    tuple(
                        dateutil.parser.parse(line['measurement_start_time'])
                        if field == 'measurement_start_time' else line[field]
                        for field in FIELDS))
            else:
                print('Skipping {}'.format(line))


if __name__ == '__main__':
    main()