var spawn = require('child_process').spawn;
var git_status = spawn('git', ['status']);
var fs = require('fs');

var create_cmd = (cmd, args) => {
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

var read_package = () => {
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

var write_package = (data) => {
    return new Promise((resolve, reject) => {
        console.log(data);
        fs.writeFile(__dirname + '/package.json', data, {flag: 'w'}, function (err) {
            if(err) {
                console.log(err);
                resolve(null);
            } else {
                console.log('写入成功');
                resolve(null);
            }
        });
    });
}

var main = async () => {
    let package = await read_package();
    let version = package.version;
    let version_arr = version.split('.').map(item => parseInt(item));
    version_arr[version_arr.length - 1] += 1;
    let new_version = version_arr.join('.');
    console.log(new_version);
    package.version = new_version;
    let res = await write_package(JSON.stringify(package));
    await create_cmd('git', [`tag`, '-a', `v${new_version}`, `-m`, `"update for test"`]);
    await create_cmd('git', ['push', '--delete', 'origin', `v${new_version}`]);
    await create_cmd('git', [`push`, `origin`, `v${new_version}`]);
    await create_cmd('git', [`tag`, `--delete`, `v${new_version}`]);
}
main();



