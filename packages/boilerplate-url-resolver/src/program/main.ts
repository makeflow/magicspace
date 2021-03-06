#!/usr/bin/env node

import * as HTTP from 'http';
import * as Path from 'path';

import {main} from 'main-function';
import fetch from 'node-fetch';
import ProxyAgent from 'proxy-agent';

import {Extract} from './@utils';

const {HTTP_PROXY} = process.env;

const agent = HTTP_PROXY
  ? ((new ProxyAgent(HTTP_PROXY) as unknown) as HTTP.Agent)
  : undefined;

main(async () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  let {url, strip = 0} = require(Path.resolve(
    '.boilerplate-options.json',
  )) as Magicspace.BoilerplateOptions;

  let response = await fetch(url, {agent});

  let extractStream = Extract(
    {
      path: '.',
      strip,
    },
    console.info,
  );

  response.body.pipe(extractStream);

  await extractStream.promise();
});
