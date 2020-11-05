from datetime import datetime

from crawler import crawler


def test_previous_get_mode():
    assert crawler.MODE_SEEDING == crawler.previous_get_mode(
        datetime(2020, 10, 1, 0, 0, 0, 1), 2019, 12, datetime(2020, 1, 1)
    )

    assert crawler.MODE_SEEDING == crawler.previous_get_mode(
        datetime(2020, 10, 1, 0, 0, 0, 2), 2020, 1, datetime(2020, 10, 1, 0, 0, 0, 1)
    )

    assert crawler.MODE_CLOSING == crawler.previous_get_mode(
        datetime(2020, 10, 1, 0, 0, 0, 1), 2020, 9, datetime(2020, 9, 30, 23, 59, 59)
    )

    assert crawler.MODE_CLOSING == crawler.previous_get_mode(
        datetime(2020, 12, 1, 0, 0, 0, 1), 2020, 9, datetime(2020, 9, 20, 23, 59, 59)
    )

    assert crawler.MODE_CRAWLING == crawler.previous_get_mode(
        datetime(2020, 10, 1, 0, 0, 2), 2020, 10, datetime(2020, 10, 1, 0, 0, 1)
    )

    assert crawler.MODE_CRAWLING == crawler.previous_get_mode(
        datetime(2020, 10, 5), 2020, 10, datetime(2020, 10, 2)
    )

    assert crawler.MODE_CRAWLING == crawler.previous_get_mode(
        datetime(2020, 10, 1, 0, 0, 2), 2020, 9, datetime(2020, 10, 1, 0, 0, 1)
    )


def test_mode_get_param():
    assert {
        "mode": crawler.MODE_SEEDING,
        "start": datetime(2020, 1, 1),
        "end": datetime(2020, 2, 1),
    } == crawler.mode_get_param(
        crawler.MODE_SEEDING, datetime(2020, 11, 4, 13, 20), 2019, 12
    )

    assert {
        "mode": crawler.MODE_CRAWLING,
        "start": datetime(2020, 11, 1),
        "end": datetime(2020, 12, 1),
    } == crawler.mode_get_param(
        crawler.MODE_CRAWLING, datetime(2020, 11, 4, 13, 20), 2020, 10
    )

    assert {
        "mode": crawler.MODE_CRAWLING,
        "start": datetime(2020, 11, 1),
        "end": datetime(2020, 12, 1),
    } == crawler.mode_get_param(
        crawler.MODE_CRAWLING, datetime(2020, 11, 4, 13, 20), 2020, 11
    )

    assert {
        "mode": crawler.MODE_CLOSING,
        "start": datetime(2020, 11, 1),
        "end": datetime(2020, 12, 1),
    } == crawler.mode_get_param(
        crawler.MODE_CLOSING, datetime(2020, 12, 4, 13, 20), 2020, 11
    )
