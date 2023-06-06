# // Developed By: Constant Marks and Michael Nutt
# // Last Modified: 11/25/2019
import pytest
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from pymongo import MongoClient
client = MongoClient('mongodb://newsDev:newB@10.125.187.72:9002/news')
db = client.news
user_col = db.users

# Testing baseline website performance 
class TestCreateuser():

  def setup_method(self, method):
    chrome_options = Options()
    chrome_options.add_argument("--window-size=1200,800")
    chrome_options.add_argument("--start-maximized")
    #chrome_options.add_argument("--headless") 
    self.driver = webdriver.Chrome('../chromedriver',options=chrome_options)
    self.driver.implicitly_wait(10)
    self.vars = {}
    self.driver.get("http://localhost:3000/article")
  
  def teardown_method(self, method):
    self.driver.quit()
  
  def baseline(self, user):
    myDynamicContent = self.driver.find_element(By.CSS_SELECTOR, ".my-sm-0")
    myDynamicContent.click()
    user = user_col.find_one()
    myDynamicContent =self.driver.find_element(By.NAME, "username")
    myDynamicContent.send_keys(user['u_id'])
    self.driver.find_element(By.NAME, "password").send_keys(user['pw'])
    self.driver.find_element(By.NAME, "password").send_keys(Keys.ENTER)
    myDynamicContent = self.driver.find_element(By.NAME, "user_area")
    myDynamicContent.click()
    self.driver.find_element(By.CSS_SELECTOR, ".my-sm-0").click()

  @pytest.mark.parametrize("user", ['test'+str(n) for n in range(10)])
  def test_baseline(self, benchmark, user):
    benchmark(self.baseline, user)
  
