# do-dump-js

do-dump-js is a Node script for smart dumping

## Installation

```bash
git clone https://github.com/Regani/do-dump-js.git
cd do-dump-js
```

## Usage

Run in your terminal as sudo user:

```bash
node main.js --dump-from=../from --dump-to=C:\Users\destination
```

## Arguments

| option       | required | example                         | description                                                                                                                                           | default |
|--------------|----------|---------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| --dump-from= | true     | --dump-from=C:\dump-from-folder | From where to dump                                                                                                                                    | -       |
| --dump-to=   | true     | --dump-to=C:\dump-to-folder     | Where to dump                                                                                                                                         | -       |
| -dn          | false    | -dn                             | Is to delete node_modules folder from source (will speed-up dump a lot)                                                                               | false   |
| -fu          | false    | -fu                             | Is to do force update. If argument not passed dumper will ignore source elements if destination have same named element which was updated more recent | false   |
| -gd          | false    | -gd                             | If argument is passed for each folder which has git will be created folders for each remote branch in destination                                     | false   |

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)