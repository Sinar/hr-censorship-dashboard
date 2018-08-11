import requests
import pymysql
import time
import dateutil.parser

FIELDS = ('anomaly', 'confirmed', 'failure', 'input', 'measurement_id',
          'measurement_start_time', 'measurement_url', 'probe_asn', 'probe_cc',
          'report_id', 'test_name')

conn = pymysql.connect(
    host='localhost',
    port=32769,
    user='root',
    password='abc123',
    db='censorship',
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor)

with conn:
    with conn.cursor() as _fetch_cursor:
        _fetch_cursor.execute('''
                              SELECT     *
                              FROM       sites s
                              JOIN       (
                                  SELECT     country_code, url, MAX(import_date) AS import_date
                                  FROM       sites
                                  GROUP BY   country_code, url
                              ) smax
                              USING      (import_date, url, country_code)
                              WHERE      country_code = %s
                              ''', ('MY', ))

        for i, row in enumerate(_fetch_cursor.fetchall()):
            response = requests.get(
                'https://api.ooni.io/api/v1/measurements',
                params={'probe_cc': row['country_code'],
                        'input': row['url']})
            result_list = response.json()

            with conn.cursor() as _insert_cursor:
                for result in result_list.get('results', []):
                    print(
                        tuple(
                            zip(FIELDS,
                                tuple(
                                    dateutil.parser.parse(result[field])
                                    if field == 'measurement_start_time' else
                                    result[field] for field in FIELDS))))
                    _insert_cursor.execute(
                        '''
                                           REPLACE
                                           INTO     measurements({})
                                           VALUES   ({})
                                           '''.format(
                            ', '.join(FIELDS), ', '.join(
                                '%s' for _ in range(len(FIELDS)))),
                        tuple(
                            dateutil.parser.parse(result[field])
                            if field == 'measurement_start_time' else
                            result[field] for field in FIELDS))

            time.sleep(1)