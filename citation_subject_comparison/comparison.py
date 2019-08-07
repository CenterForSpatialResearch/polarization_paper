##make dictionaries for all columns
import csv
import json
import collections

def commonPapers():
    citingIds = []
    counter = 0
    with open("data_processing/citing_original.csv", 'rb') as csvfile1:
        reader1 = csv.reader(csvfile1)
        next(csvfile1)
       
        for row1 in reader1:
            id1 = row1[8]
            common = False
            
            with open('data_processing/subject_homophily.csv', 'rb') as csvfile2:
                reader2 = csv.reader(csvfile2)
                csvfile2.seek(0)
                next(csvfile2)
            
                for row2 in reader2:
                    id2 = row2[8]
                    if id1 == id2:
                        common = True
                        row1.append("common")
                        with open("data_processing/common.csv","a") as outfile:
                            writer = csv.writer(outfile)
                            writer.writerow(row1)
                        counter+=1
            
            
    print counter
    
#commonPapers()   

def merge():
    commonIds = []
    with open('data_processing/common.csv', 'rb') as csvfile2:
        reader2 = csv.reader(csvfile2)
        csvfile2.seek(0)
        for row2 in reader2:
            commonIds.append(row2[8])
            with open("data_processing/merge.csv","a") as outfile:
                writer = csv.writer(outfile)
                writer.writerow(row2)
    
    with open("data_processing/citing_original.csv", 'rb') as csvfile1:
        reader1 = csv.reader(csvfile1)
        next(csvfile1)
        for row1 in reader1:
            id1 = row1[8]
            if id1 not in commonIds:
                row1.append("citing")
                with open("data_processing/merge.csv","a") as outfile:
                    writer = csv.writer(outfile)
                    writer.writerow(row1)
                    
    with open("data_processing/subject_homophily.csv", 'rb') as csvfile3:
        reader3 = csv.reader(csvfile3)
        next(csvfile3)
        for row3 in reader3:
            id3 = row3[8]
            if id3 not in commonIds:
                row3.append("subject")
                with open("data_processing/merge.csv","a") as outfile:
                    writer = csv.writer(outfile)
                    writer.writerow(row3)
                
   
#merge()



def wordSearchCount():
    counter = 0 
    with open('webOfScience_homophilySubjectPapers_abstracts.csv', 'rb') as csvfile:
        spamReader = csv.reader(csvfile)
        for row in spamReader:
            if "homophily" in row[0] or "Homophily" in row[0]:
                 counter+=1
                 
    print counter
    
#wordSearchCount()