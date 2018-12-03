const spawn = require('child_process').spawn;
const git_status = spawn('git', ['status']);
const fs = require('fs');

const create_cmd = (cmd, args) => {
    return new Promise((resolve, reject) => {
        var git_status = spawn(cmd, args);
        git_status.on('exit', function (data) {
            console.log('git push end1');
            console.log(args);
            resolve(data);
            return ;
        });
    });
}

const read_package = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(__dirname + '/package.json', {flag: 'r+', encoding: 'utf8'}, function (err, data) {
            if(err) {
             return;
            }
            console.log(data);
            resolve(JSON.parse(data));
        });
    });
}

const write_package = (data) => {
    return new Promise((resolve, reject) => {
        console.log(data);
        fs.writeFile(__dirname + '/package.json', data, {flag: 'w'}, function (err) {
            if(err) console.log(err);
            resolve(null);
        });
    });
}

const main = async () => {
    let package = await read_package(),
        version = package.version,
        version_arr = version.split('.').map(item => parseInt(item)),
        new_version = null;
        
    version_arr[version_arr.length - 1] += 1;
    new_version = version_arr.join('.');
    console.log(new_version);
    package.version = new_version;
    let res = await write_package(JSON.stringify(package));
    await create_cmd('git', [`tag`, '-a', `v${new_version}`, `-m`, `"update for test"`]);
    await create_cmd('git', ['push', '--delete', 'origin', `v${new_version}`]);
    await create_cmd('git', [`push`, `origin`, `v${new_version}`]);
    await create_cmd('git', [`tag`, `--delete`, `v${new_version}`]);
    console.log('update tag successfull')
}
main();



