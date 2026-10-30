import re
L='/home/claude/libs/node_modules/'
libs=[L+'gsap/dist/gsap.min.js',L+'gsap/dist/ScrollTrigger.min.js',L+'lenis/dist/lenis.min.js']
s=open('index.html').read()
tags=''
for f in libs:
    c=open(f).read()
    assert '</script' not in c.lower(), f
    tags+='<script>'+c+'</script>\n'
s=s.replace('<!--LIBS-->',tags)
s=s.replace('/*__MOTION__*/',open('motion.js').read())
open('dist/index.html','w').write(s)
print(len(s))
