$projectRoot = split-path -parent $PSScriptRoot

$installTopDirName = 'portable-node-npm'
$installPath = "$installTopDirName/install-dir"
$zipPath = (get-item $projectRoot/$installTopDirName/node*.zip).FullName
if (-not (test-path $projectRoot/$installPath))
{
    New-Item -Type Directory $projectRoot/$installPath
    Expand-Archive -Force $zipPath ./$installPath
    Rename-Item (get-item ./portable-node-npm/install-dir/node*) node
}
if (-not (test-path $projectRoot/node_modules) -or -not (test-path $projectRoot/vscode-extension/node_modules)) {
    npm run install-both
}
