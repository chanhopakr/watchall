from datetime import datetime
from ipaddress import ip_address, ip_network
import json
import yaml


def kwargs_json_parse(**kwargs):
    """"""
    parsed_kwargs = {}

    for key, value in kwargs.items():
        try:
            decoded = json.loads(value, parse_float=str) if value else value
        except (TypeError, json.JSONDecodeError):
            parsed_kwargs[key] = value
        else:
            parsed_kwargs[key] = decoded

    return parsed_kwargs


def string_address_to_range(address, default=None, sep=','):
    """String format IP address and IP range to valid unique IP address

    :param address:
      '1.1.1.9' -> {'1.1.1.9'}
      '1.1.1.9, 1.1.1' -> {'1.1.1.9'}  (except invalid '1.1.1')
      '1.1.1.0/29' -> {'1.1.1.1', '1.1.1.2', ..., '1.1.1.6'}
      '1.1.1.0/29, 1.1.1.9' -> {'1.1.1.1', '1.1.1.2', ...,'1.1.1.6', '1.1.1.9'}
    :param default:
    :param sep: address separator
    :return: set or None or str
    """
    if not isinstance(address, str):
        address = f'{address}'

    result = set()
    try:
        for addr in address.split(sep):
            addr = addr.strip()
            if not addr:
                continue

            try:
                if addr.rfind('/') == -1:
                    result.add(ip_address(addr).compressed)
                else:
                    result.update(
                        host.compressed for host in ip_network(addr).hosts())
            except ValueError as e:
                print(e)
    except AttributeError as e:
        print(e)
    else:
        return result or default


def string_port_to_range(ports, default=None, sep=',', range_separator='-'):
    """String port and port range to valid unique ports

    :param ports:
      21 or '21' -> {21}
      '22-23' -> {22, 23}
      '21, 22-23' or [21, '22-23'] -> {21, 22, 23}
    :param default:
    :param sep: address separator
    :param range_separator: ports 값안의 port 대역 구분자 (default='-')
    :return: set
    """
    if isinstance(ports, int):
        return {ports}
    if isinstance(ports, str):
        ports = ports.split(sep)

    result = set()
    for port in ports:
        if isinstance(port, int):
            result.add(port)
        else:
            port = port.strip()
            if not port:
                continue

            try:
                if port.find(range_separator) == -1:
                    result.add(int(port))
                else:
                    start, limit = port.split(range_separator)
                    result.update((
                        port for port in range(int(start), int(limit) + 1)))
            except (TypeError, ValueError) as e:
                print(e)
    return result or default


def yaml_loader(file):
    try:
        with open(file) as f:
            text = f.read()
        data = yaml.load(text, Loader=yaml.loader.BaseLoader)
    except FileNotFoundError:
        return {}
    else:
        return data


def datetime_str_range(stop_datetime_str, start_datetime_str=None, step=0):
    """"""
    if step < 3600:
        fmt = '%Y-%m-%d %H:%M:00'
    elif step < 86400:
        fmt = '%Y-%m-%d %H:00:00'
    elif step < 86400 * 4:
        fmt = '%Y-%m-%d 00:00:00'
    elif step > 86400 * 3:
        fmt = '%Y-%m-01 00:00:00'
    else:
        return []

    stop_dt_str = datetime.fromisoformat(stop_datetime_str).strftime(fmt)
    stop_dt = datetime.strptime(stop_dt_str, fmt)
    stop_ts = int(stop_dt.timestamp())

    if start_datetime_str:
        start_dt_str = datetime.fromisoformat(start_datetime_str).strftime(fmt)
        start_dt = datetime.strptime(start_dt_str, fmt)
        start_ts = int(start_dt.timestamp())
    else:
        start_ts = stop_ts - step
        start_dt = datetime.fromtimestamp(start_ts)
        start_dt_str = start_dt.strftime(fmt)

    return [(datetime.fromtimestamp(ts).strftime(fmt),
             datetime.fromtimestamp(ts + step).strftime(fmt))
            for ts in range(start_ts, stop_ts, step)]
