FROM ruby:3.2.2

RUN apt-get update -qq && apt-get install -y build-essential nodejs ruby-dev libmariadb-dev libmariadb-dev-compat yarn

WORKDIR /rails_back

COPY . .
# COPY ./Gemfile.lock .


RUN bundle install


CMD ["rm", "-rf", "./tmp/pids/server.pid"]

# RUN rails db:setup
