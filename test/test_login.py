# // Developed By: Constant Marks and Michael Nutt
# // Last Modified: 11/25/2019
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By

# test website for Login/Logout speed
class TestLoginLogout():
  def setup_method(self, method):

    self.driver = webdriver.Chrome()
    self.vars = {}
  
  def teardown_method(self, method):
    self.driver.find_element(By.CSS_SELECTOR, ".my-sm-0").click()
    self.driver.quit()
  
  def test_login_logout(self):
    self.driver.get("http://54.202.121.146/article/")
    self.driver.set_window_size(1536, 835)
    self.driver.find_element(By.NAME, "username").click()
    self.driver.find_element(By.NAME, "username").send_keys("test")
    self.driver.find_element(By.NAME, "password").send_keys("test")
    self.driver.find_element(By.CSS_SELECTOR, ".btn-secondary:nth-child(1)").click()
    self.driver.find_element(By.CSS_SELECTOR, ".my-sm-0").click()
  
