import requests
import urllib
import re
import random
from time import sleep
def main():
    url = 'https://www.zhihu.com/question/22591304/followers'
    headers = { u"省略" }
    i = 1
    for x in xrange(20,3600,20):
        data = {'start': '0', 'offset': str(x), '_xsrf': 'a128464ef225a69348cef94c38f4e428'}
        content = requests.post(url, headers=headers, data=data, timeout=10).text
        imgs = re.findall('<img src=\\\\\"(.*?)_m.jpg', content)
        for img in imgs:
            try:
                img = img.replace('\\','')
                pic = img+'.jpg'
                path = 'd:\\bs4\\zhihu\\jpg\\'+str(i)+'.jpg'
                urllib.urlretrieve(pic, path)
                print u'下载了第' + str(i) + u'张图片'
                i += 1
                sleep(random.uniform(0.5, 1))

            except:
                print u'抓漏1张'
                pass

        sleep(random.uniform(0.5, 1))

if __name__ == '__main__':
    main()