#!/bin/sh

pnpm migrate

if [ $? -eq 0 ]; then
  echo "Migration successful"
else
  echo "Migration failed"
  exit 1
fi