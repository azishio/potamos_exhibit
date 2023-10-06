FROM python:3.12.0-bullseye

# Node.js
RUN apt-get update
RUN apt-get install -y ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update
RUN apt-get install -y nodejs

# GPU.js依存
RUN apt-get install -y libxi-dev build-essential libgl1-mesa-dev wget
ENV PKG_CONFIG_PATH=/usr/lib/pkgconfig

RUN wget https://developer.download.nvidia.com/compute/cuda/repos/debian11/x86_64/cuda-keyring_1.1-1_all.deb
RUN dpkg -i cuda-keyring_1.1-1_all.deb
RUN apt-get update
RUN apt-get install -y software-properties-common
RUN add-apt-repository contrib
RUN apt-get update
RUN apt-get -y install cuda
RUN apt-get install -y xorg xserver-xorg xvfb libx11-dev libxext-dev pkg-config

RUN apt-get install -y gawk bison
RUN mkdir $HOME/glibc/ \
    && cd $HOME/glibc \
    && wget http://ftp.gnu.org/gnu/libc/glibc-2.32.tar.gz \
    && tar -xvzf glibc-2.32.tar.gz \
    && mkdir build  \
    && mkdir glibc-2.32-install \
    && cd build \
    && $HOME/glibc/glibc-2.32/configure --prefix=$HOME/glibc/glibc-2.32-install \
    && make \
    && make install
RUN rm /lib/x86_64-linux-gnu/libc.so.6
RUN ln -s ~/glibc/glibc-2.32-install/lib/libc-2.32.so /lib/x86_64-linux-gnu/libc.so.6

RUN apt-get clean

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm i