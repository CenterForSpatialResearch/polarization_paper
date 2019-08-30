##make dictionaries for all columns
import csv
import json
import collections
import operator


def saveAreaCountYear(outfile,year):
    with open(str(year)+'.txt', 'rb') as tsvfile:
        reader = csv.DictReader(tsvfile, dialect='excel-tab')
         
        for row in reader:
            area = row['\xef\xbb\xbfResearch Areas']
            count = row["records"]
            if count!=None:
                print area, count
                outfile.writerow([area,count,year])

##with open("outfile.csv","a")as output:
##    writer = csv.writer(output)
##    
##
##    for i in range(2008,2019):
##        print i
##        saveAreaCountYear(writer,i)
##    



with open("field_count_year.csv","rb")as inputFile:
    reader = csv.reader(inputFile)
    dictByYear = {}
    
    for row in reader:
        year = row[2]
        count = row[1]
        field = row[0]
        
        if year not in dictByYear.keys():
            dictByYear[year]={}
            dictByYear[year][field]=count
        else:
            dictByYear[year][field]=count

   # print dictByYear
    
    arrayByYear = []
    
    for i in dictByYear:
        dictByYear[i]["year"]=i
        arrayByYear.append(dictByYear[i])
    print arrayByYear
  #  with open("fieldByYear.json","w")as outputFile:
  #      json.dump(dictByYear,outputFile)
  #          
        
        