#!/usr/bin/env python
import re
import httplib
from os import path as os_path

WIKI_HOST = "en.wikipedia.org"
PAGE = "/wiki/ISO_3166-1"
IMG_HOST = "upload.wikimedia.org"


class FlagDownloader:
    def get(self, host, path):
        conn = httplib.HTTPConnection(host)
        conn.request("GET", path)
        resp = conn.getresponse()
        return resp.read()

    def parse(self, page):
        return re.findall('img alt="(.*?)" src="//upload.wikimedia.org(.*?)".*?</td>\s+<td>.*?</td>\s+<td>.*?</td>\s+<td>(.*?)</td>', page)

    def run(self):
        page = self.get(WIKI_HOST, PAGE)
        images = self.parse(page)

        for kor_name, path, alpha2 in images:
            img = self.get(IMG_HOST, path)

            with open(os_path.join(os_path.curdir, '%s.png' % alpha2), 'w') as f:
                f.write(img)


def main():
    FlagDownloader().run()


if __name__ == '__main__':
    main()

# EOF
