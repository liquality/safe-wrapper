# Safe-Wrapper
A wrapper sdk for the interacting with safe backend service and safe protocols. under the hood it uses   
- @safe-global/api-kit,
- @safe-global/protocol-kit
- @safe-global/relay-kit

### How to extend - What you should know. 
- Specific use cases for the safe wallet are grouped under the [modules folder](/Users/davidenebeli/Liquality/safe-wrapper/src/modules)
- General functionalities for managing the safe are grouped under [services](/Users/davidenebeli/Liquality/safe-wrapper/src/services)
 
### How to Publish a new version
- clone repo
- run `yarn install`
- make changes
- update the [.npmrc file](.npmrc)
- run `yarn build`
- run `yarn publish`


### How to test
 - Create ***.env*** file by editting the [.env.example](.env.example)
 - run `yarn test`


### How to use
See the [test](test/group-service.test.ts) for examples