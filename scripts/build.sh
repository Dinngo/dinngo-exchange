# Configure to exit script as soon as a command fails.
set -o errexit

# Configure the existing build directory.
rm -rf build

# Create a temporary directory to place ignored files (e.g. examples).
tmp_dir="ignored_contracts"
mkdir "$tmp_dir"

# Move the ignored files to the temporary directory.
while IFS="" read -r ignored
do
    mv "contracts/$ignored" "$tmp_dir"
done < contracts/.npmignore

# Perform linting
node_modules/.bin/solhint "contracts/**/*.sol"

# Compile everything else.
npm run compile

# Return the ignored files to their place.
mv "$tmp_dir/"* contracts/

# Delete the temporary directory.
rmdir "$tmp_dir"
