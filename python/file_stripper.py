# // Developed By: Constant Marks and Michael Nutt
# // Last Modified: 11/25/2019

# simple helper script to fix some file names and delete source tags
import os, io, sys, glob

files = glob.glob('./Articles/*.html')

for f in files:
    print(f)
    readFile = open(f, errors='ignore')
    lines = readFile.readlines()
    readFile.close()
    w = open(f,'w')
    w.writelines([item for item in lines[:-1]])
    w.close()


bad_names = glob.glob('../Articles/*')
for name in bad_names:
    if name[0]=='s':
        print(name)
        os.rename(name,name[1:])