'''
this script populates the databses with articles from the ars rss news feed, 
randomlly generate users, comments, and ranks
''' 

# // Developed By: Constant Marks and Michael Nutt
# // Last Modified: 11/25/2019

import json
from random import randint, sample
from itertools import combinations
import names
from essential_generators import DocumentGenerator
from pymongo import MongoClient
from bson import ObjectId
import rss_reader
from datetime import datetime
from dateutil import parser
from rss_reader import ArticleLoader

## Connect to Mongo and generate collection objects
client = MongoClient("mongodb+srv://admin:UkIviLy2FbfupOy7@newb.a31n6wu.mongodb.net/?retryWrites=true&w=majority")
db = client.newb
user_col = db.users
article_col = db.articles
tag_col = db.tags

# create random document generator
gen = DocumentGenerator()


# calls the ArticleLoader class to pull down articles from the rss news feed
# save the files html data, and push article dosumtnes to db
def update_articles():
    print('adding articles....')
    AL = ArticleLoader()
    # fetch new articles
    new_articles = AL.fetchNew()

    # push articles to db
    for article in new_articles:
        # print(article)
        # print('Inserting: ', article['title'], '\nwith tags', article['tags'])
        article_col.insert_one(article)
        #article_col.insert_many(new_articles)

def update_tags():
    tags = ["Biz & IT", "Tech",  "Science", "Policy" ,"Cars", "Gaming and Culture"]
    for tag in tags:
        tag_col.insert_one({"tag":tag})

# retrievs all article and tag ids
def getArticlesAndTags():
    # get all the articles from the db
    article_ids = []
    for doc in article_col.find():
        article_ids.append(str(doc['_id']))

    # get the the eavilable tags from the db
    tags = []
    for doc in tag_col.find():
        tags.append(doc['tag'])

    return article_ids, tags

# creates random users and pushes them to the db
def genUsers(article_ids, tags, n_users=10000, drop_users=True,test_user=False):
    # article_ids [] - list of ids to generate random favorites, votes and comments
    # list of tags [] - list of tags to to generate random follows
    # n_users (int)- specifies the number of random users to generate
    # drop_users (bool) - specifies wether to drop all users before adding more
    # test_user (bool) - specifeis wether or nad to add the test user

    print('adding users....')

    if drop_users:
        # drop users
        db.users.drop()

    # genrate the users to insert
    users = []

    # a test user if requested
    if test_user:
        test_user = {
                    'u_id':'test',
                    'f_name':'Testy',
                    'l_name':'Tester',
                    'pw': 'test',
                    'email': 'test@email.com',
                    'create_date': datetime.utcnow(),
                    'follows': sample(tags, 2),
                    'favorites': [ObjectId(id) for id in sample(article_ids, k = randint(0,20))],
                    'voted_on' : [{'article': ObjectId(id), 'vote':sample([-1,1], 1)[0]} for id in sample(article_ids, k = randint(0,len(article_ids)))],
                    'commented_on' : [ObjectId(id) for id in sample(article_ids, k = randint(0,10))]
                    }

        users.append(test_user)

    # n_user random users
    for i in range(n_users):
        m_f = randint(0,1)
        if m_f == 0: 
            gender = 'male'
        else:
            gender = 'female'
        
        f_name = names.get_first_name(gender)
        l_name = names.get_last_name()
        u_id = f_name[0]+l_name
        pw = f_name[0:2]+l_name[0:2] + "".join([str(randint(0,9)) for i in range(5)])
        email = u_id + '@email.com'
        user = {
            'u_id':u_id,
            'f_name':f_name,
            'l_name':l_name,
            'pw': pw,
            'email': email,
            'create_date': datetime.utcnow(),          
            'follows': sample(tags,3),
            'favorites': [ObjectId(id) for id in sample(article_ids, k = randint(0,20))],
            'voted_on' : [{'article': ObjectId(id), 'vote':sample([-1,1], 1)[0]} for id in sample(article_ids, k = randint(0,len(article_ids)))],
            'commented_on' : [ObjectId(id) for id in sample(article_ids, k = randint(0,10))]
            }
        users.append(user)

    # insering the users
    user_col.insert_many(users)
    return users


# genrates random comments and calualtes ranks
def articleCommentAndRank(article_ids, users, comments= True,  drop_comm=True):
    # article_ids [] - list of ids to generate random favorites, votes and comments
    # users [] - list of users with comments and votes to update the articles with
    # comments (bool) - generate comments 
    # drop_comm (bool) - drop all comments before proceeding

    print('adding coments and rankings....')

    # first drop existing comments
    if drop_comm:
        article_col.update({}, {'$unset': {'comments':""}},multi=True)

    # generating random comments and votes
    for article in article_ids:
        rank = 0
        for user in users:
            # check each user and comment if there are any
            if comments:
                for c_article in user['commented_on']:
                    if c_article==ObjectId(article):
                        user = user_col.find_one({'u_id': user['u_id']})
                        comment = gen.sentence()
                        article_col.find_one_and_update(
                            {'_id':ObjectId(c_article)}, 
                            {"$push": {'comments':
                                {'u_id': user['_id'], 
                                'text': comment,
                                'rank':randint(-10,10),
                                'date':datetime.utcnow()
                                }
                                }
                            })
            # check each user and update rank vote if there are any
            for v_article in user['voted_on']:
                #print(v_article)
                if v_article['article']==ObjectId(article):
                    rank += v_article['vote']
        if rank>0:
            
            # print(f'{article} rank to update', rank)
            continue

        # update rank
        article_col.find_one_and_update(
                        {'_id':ObjectId(article)}, 
                        { '$set' : {'rank':rank}})

# helper function to update article dates to proper format
def fixDate(article_ids):
    # fix datetime column
    for article in article_ids:
        record = article_col.find_one({'_id':ObjectId(article)})
        article_col.find_one_and_update(
                        {'_id':ObjectId(article)}, 
                        {"$set": {'date':parser.parse(record['date'])}})

# helper function to fix file path error on some of the documents
def fixFilePath():
        records = article_col.find({'filepath': {'$regex':'Articles'}})
        for r in records:
            print(r['filepath'])
            article_col.find_one_and_update(
                        {'_id':ObjectId(r['_id'])},
                        {"$set": {'filepath': r['filepath'].replace('Articles','Articles/')}})
      


# helper function to remove duplicated in tthe articles db
def removeDuplicates():
    # removing duplicate articles
    remove_dups = [
        {'$group': {'_id': {'title': '$title'}, 
                    'dups': {'$addToSet': '$_id'}, 
                    'count': {'$sum': 1}}
        },
        {'$match': {'count': {'$gt': 1}}
        }
    ]
    duplicates = list(article_col.aggregate(remove_dups))

    for d in duplicates:
        print(d['dups'][0])
        article_col.delete_one({'_id':d['dups'][0]})

# helper function to delete test users        
def remove_test():
    # removing duplicate articles
    tests = user_col.find({'u_id':{'$regex':'test'},'f_name':"Test"})
    for t in tests:
        user_col.delete_one({'u_id':t['u_id']})
         

# set parameters here for runtime
if __name__ == "__main__":
    update_articles()
    update_tags()
    articles, tags = getArticlesAndTags()
    print(tags)
    users = genUsers(articles, tags,n_users=500, drop_users=False,test_user=True)
    users = list(user_col.find({}))
    articleCommentAndRank(articles, users,comments=True, drop_comm=False)
    removeDuplicates()
    #fixFilePath()