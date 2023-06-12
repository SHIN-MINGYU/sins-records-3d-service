FROM ruby:3.2.2

RUN apt-get update -qq && apt-get install -y build-essential nodejs ruby-dev libmariadb-dev libmariadb-dev-compat yarn

WORKDIR /rails_back

COPY . .
# COPY ./Gemfile.lock .


RUN bundle install

# RUN rails db:setup

# CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "8080"]