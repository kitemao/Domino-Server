var FILE_MAPPING = {
    Mac :　{
        '64bit' : {
            ruby : 'ruby2.0.0',
            nodejs : 'http://nodejs.org/dist/v0.10.22/node-v0.10.22.pkg',
            git : 'https://git-osx-installer.googlecode.com/files/git-1.8.4.2-intel-universal-snow-leopard.dmg'
        }
    },
    Windows : {
        '32bit' : {
            ruby : 'http://dl.bintray.com/oneclick/rubyinstaller/rubyinstaller-2.0.0-p247.exe?direct',
            nodejs : 'http://nodejs.org/dist/v0.10.22/node-v0.10.22-x86.msi',
            git : 'https://msysgit.googlecode.com/files/Git-1.8.4-preview20130916.exe'
        },
        '64bit' : {
            ruby : 'http://dl.bintray.com/oneclick/rubyinstaller/rubyinstaller-2.0.0-p247-x64.exe?direct',
            nodejs : 'http://nodejs.org/dist/v0.10.22/x64/node-v0.10.22-x64.msi',
            git : 'https://msysgit.googlecode.com/files/Git-1.8.4-preview20130916.exe'
        }
    },
    Linux : {
        '32bit' : {
            ruby : 'ruby2.0.0',
            nodejs : 'http://nodejs.org/dist/v0.10.22/node-v0.10.22-linux-x86.tar.gz',
            git : 'git=1.8.4'
        },
        '64bit' : {
            ruby : 'ruby2.0.0',
            nodejs : 'http://nodejs.org/dist/v0.10.22/node-v0.10.22-linux-x64.tar.gz',
            git : 'git=1.8.4'
        }
    }
};

module.exports = {
    get : function  (req, res) {
        var os = req.query.os || 'Mac';
        var cpuClass = req.query.cpu || '64bit';

        var target = FILE_MAPPING[os][cpuClass];

        res.set('Content-Type', 'application/octet-stream');

        if (os === 'Windows') {
            res.set('Content-Disposition', 'attachment;filename=setup.bat');
        } else {
            res.set('Content-Disposition', 'attachment;filename=setup.sh');
        }

        res.send(target);
    }
};
