# // Developed By: Constant Marks and Michael Nutt
# // Last Modified: 11/25/2019
import pytest
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.options import Options
from pymongo import MongoClient
from time import sleep

client = MongoClient('mongodb+srv://admin:UkIviLy2FbfupOy7@newb.a31n6wu.mongodb.net/?retryWrites=true&w=majority')
db = client.news
user_col = db.users


# Testing website for delete user operation
class TestDeleteuser():

  def setup_method(self, method):
    chrome_options = Options()
    chrome_options.add_argument("--window-size=1200,800")
    chrome_options.add_argument("--start-maximized")
    #chrome_options.add_argument("--headless") 
    self.driver = webdriver.Chrome('../chromedriver',options=chrome_options)
    self.driver.implicitly_wait(10)
    self.vars = {}
    self.driver.get("http://54.202.121.146/article/")

  def teardown_method(self, method):
    self.driver.quit()
  
  #@pytest.mark.parametrize("user", user_col.find({'u_id':{'$regex':'test'},'f_name':""})[:5])
  def deleteuser(self):
    user = user_col.find_one({'u_id':{'$regex':'test'},'f_name':""})
    self.driver.find_element(By.NAME, "username").click()
    self.driver.find_element(By.NAME, "username").send_keys(user['u_id'])
    self.driver.find_element(By.NAME, "password").send_keys(user['pw'])
    self.driver.find_element(By.NAME, "password").send_keys(Keys.ENTER)
    myDynamicContent = self.driver.find_element(By.NAME, "user_area")
    myDynamicContent.click()
    # self.driver.find_element(By.LINK_TEXT, "Hello*").click()
    self.driver.find_element(By.CSS_SELECTOR, ".btn:nth-child(3)").click()
    self.driver.find_element(By.CSS_SELECTOR, ".btn-danger").click()
    assert self.driver.find_element(By.CSS_SELECTOR, ".my-2:nth-child(2)").text == "CREATE ACCOUNT"
  
  @pytest.mark.parametrize('test',['test'+str(n) for n in range(10)])
  def test_deleteuser(self, benchmark, test):
     benchmark(self.deleteuser)

  