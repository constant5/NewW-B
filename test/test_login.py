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

# test website for Login/Logout speed
class TestLoginLogout():
  def setup_method(self, method):
    self.driver = webdriver.Chrome()
    self.vars = {}
  
  def teardown_method(self, method):
    self.driver.find_element(By.CSS_SELECTOR, ".my-sm-0").click()
    self.driver.quit()
  
  def test_login_logout(self):
    self.driver.get("http://10.125.187.72:8000/article")
    self.driver.set_window_size(1536, 835)
    self.driver.find_element(By.NAME, "username").click()
    self.driver.find_element(By.NAME, "username").send_keys("test")
    self.driver.find_element(By.NAME, "password").send_keys("test")
    self.driver.find_element(By.CSS_SELECTOR, ".btn-secondary:nth-child(1)").click()
    self.driver.find_element(By.CSS_SELECTOR, ".my-sm-0").click()
  
