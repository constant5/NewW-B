# // Developed By: Constant Marks and Michael Nutt
# // Last Modified: 11/25/2019
import pytest
import time
import json
from random import randint
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from time import sleep

# Testing website for create user operation
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


  #@pytest.mark.parametrize('user',['test'+str(n) for n in range(10)])
  def createuser(self, user):
    user = user + '_' + str(randint(0,1000000))
    myDynamicContent = self.driver.find_element(By.CSS_SELECTOR, ".my-sm-0")
    myDynamicContent.click()
    myDynamicContent = self.driver.find_element(By.CSS_SELECTOR, ".my-2:nth-child(2)")
    myDynamicContent.click()
    self.driver.find_element(By.NAME, "email").click()
    self.driver.find_element(By.NAME, "email").send_keys(user)
    self.driver.find_element(By.CSS_SELECTOR, ".form-control-plaintext:nth-child(4)").send_keys(user)
    self.driver.find_element(By.CSS_SELECTOR, ".form-control-plaintext:nth-child(5)").send_keys(user)
    self.driver.find_element(By.NAME, "password2").send_keys(user)
    self.driver.find_element(By.NAME, "password2").send_keys(Keys.ENTER)
    myDynamicElement = self.driver.find_element(By.NAME, "user_area")
    assert myDynamicElement.text == "Hello"
    self.driver.find_element(By.CSS_SELECTOR, ".my-sm-0").click()
    
  @pytest.mark.parametrize('user',['test'+str(n) for n in range(10)])
  def test_createuser(self, benchmark, user):
    benchmark(self.createuser, user)
  
