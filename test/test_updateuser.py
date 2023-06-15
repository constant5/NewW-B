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
from pymongo import MongoClient
from selenium.webdriver.chrome.options import Options
client = MongoClient('mongodb+srv://admin:UkIviLy2FbfupOy7@newb.a31n6wu.mongodb.net/?retryWrites=true&w=majority')
db = client.news
user_col = db.users

# Testing website for update user speed
class TestUpdateuser():
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
  
  def updateuser(self):
    self.driver.find_element(By.CSS_SELECTOR, ".my-sm-0").click()
    user = user_col.find_one({'u_id':{'$regex':'test'},'f_name':""})
    #print(user)
    self.driver.find_element(By.NAME, "username").send_keys(user['u_id'])
    self.driver.find_element(By.NAME, "password").send_keys(user['pw'])
    self.driver.find_element(By.NAME, "password").send_keys(Keys.ENTER)
    myDynamicContent = self.driver.find_element(By.NAME, "user_area")
    myDynamicContent.click()
    self.driver.find_element(By.CSS_SELECTOR, ".btn-sm:nth-child(1)").click()
    self.driver.find_element(By.CSS_SELECTOR, ".col-sm-10:nth-child(2) > .form-control-plaintext").click()
    self.driver.find_element(By.CSS_SELECTOR, ".col-sm-10:nth-child(2) > .form-control-plaintext").clear()
    self.driver.find_element(By.CSS_SELECTOR, ".col-sm-10:nth-child(2) > .form-control-plaintext").send_keys("Test")
    self.driver.find_element(By.CSS_SELECTOR, ".col-sm-10:nth-child(4) > .form-control-plaintext").clear()
    self.driver.find_element(By.CSS_SELECTOR, ".col-sm-10:nth-child(4) > .form-control-plaintext").send_keys("Test")
    self.driver.find_element(By.CSS_SELECTOR, "#mod01 .btn-primary").click()
    myDynamicContent =self.driver.find_element(By.LINK_TEXT, "Hello Test")
    assert myDynamicContent.text == "Hello Test"
    self.driver.find_element(By.CSS_SELECTOR, ".my-sm-0").click()
  
  @pytest.mark.parametrize('test',['test'+str(n) for n in range(10)])
  def test_updateuser(self, benchmark, test):
     benchmark(self.updateuser)