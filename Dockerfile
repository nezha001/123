FROM debian
RUN apt update
RUN apt-get -y install vim curl iputils-ping telnet
RUN DEBIAN_FRONTEND=noninteractive apt install firefox-esr mate-system-monitor  git lxde tightvncserver wget   -y
RUN wget https://github.com/novnc/noVNC/archive/refs/tags/v1.2.0.tar.gz
RUN tar -xvf v1.2.0.tar.gz
RUN mkdir  /root/.vnc
RUN echo 'ywsj.cf' | vncpasswd -f > /root/.vnc/passwd
RUN chmod 600 /root/.vnc/passwd
RUN cp /noVNC-1.2.0/vnc.html /noVNC-1.2.0/index.html
RUN echo 'cd /root' >>/ywsj.sh
RUN echo "su root -l -c 'vncserver :2000 ' "  >>/ywsj.sh
RUN echo 'cd /noVNC-1.2.0' >>/ywsj.sh
RUN echo './utils/launch.sh  --vnc localhost:7900 --listen 80 ' >>/ywsj.sh
RUN echo root:ywsj.cf|chpasswd
RUN chmod 755 /ywsj.sh
EXPOSE 80
CMD  /ywsj.sh
