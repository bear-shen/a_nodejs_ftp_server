tcp.port==21||tcp.port==2121||(tcp.srcport <= 15000 and tcp.srcport>=12000) ||(tcp.dstport <=15000 and tcp.dstport>=12000)  and tcp.port!=14148




```text
fillzilla一直识别为ascii，需要UTF8支持

15:33:13	响应:	230 Login successful.
15:33:13	追踪:	CFtpLogonOpData::ParseResponse() in state 6
15:33:13	状态:	服务器不支持非 ASCII 字符。
```

PASV建立以后filezilla无法连接，原因不明
    怀疑是wsl的问题，先做别的吧
可能是上面衍生的问题，PASV建立server以后无法判断socket有没有建立
端口占用的判断
filezilla自己调的mlsd但是socket用的list，原因不明



