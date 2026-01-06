package us11;

import java.time.Duration;

import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.*;

public class DoctorChatTest {

    static final String BASE_URL = "http://localhost:3000";
    static final String DOCTOR_USER = "doctor01";
    static final String DOCTOR_PASS = "anhhiepdz";
    static final String PATIENT_NAME = "PHAM GIA HIEP22";

    public static void main(String[] args) {
        WebDriver driver = new ChromeDriver();
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(40));

        try {
            driver.manage().window().maximize();

            // Open login
            driver.get(BASE_URL + "/login");

            WebElement userInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.cssSelector("form.auth-card input[autocomplete='username']")));
            userInput.clear();
            userInput.sendKeys(DOCTOR_USER);

            WebElement passInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.cssSelector("form.auth-card input[autocomplete='current-password']")));
            passInput.clear();
            passInput.sendKeys(DOCTOR_PASS);

            WebElement loginBtn = wait.until(ExpectedConditions.elementToBeClickable(
                    By.cssSelector("form.auth-card button.btn[type='submit']")));
            loginBtn.click();

            wait.until(ExpectedConditions.or(
                    ExpectedConditions.urlContains("/dashboard"),
                    ExpectedConditions.presenceOfElementLocated(By.xpath("//*[contains(.,'Đăng xuất')]")),
                    ExpectedConditions.presenceOfElementLocated(By.xpath("//*[contains(.,'doctor01')]"))
            ));

            System.out.println("✅ Đăng nhập thành công. URL hiện tại: " + driver.getCurrentUrl());


            WebElement chatLink = wait.until(ExpectedConditions.elementToBeClickable(
                    By.cssSelector("a[href='/doctor-chat']")));
            chatLink.click();

   
            wait.until(ExpectedConditions.urlContains("/doctor-chat"));
            System.out.println("✅ Đã điều hướng đến /doctor-chat");

            WebElement searchPatient = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.cssSelector("input[placeholder^='Tìm kiếm bệnh nhân']")));

       
            WebElement patientRow = wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//div[normalize-space()='" + PATIENT_NAME + "']")));
            patientRow.click();

            WebElement messageInput = wait.until(ExpectedConditions.elementToBeClickable(
                    By.cssSelector("input[placeholder^='Nhập tin nhắn']")));

            String msg = "US11_AUTO_" + System.currentTimeMillis() + " - Bác sĩ trả lời";
            messageInput.clear();
            messageInput.sendKeys(msg);

            WebElement sendBtn = wait.until(ExpectedConditions.elementToBeClickable(
                    By.cssSelector("button.chip-btn")));
            sendBtn.click();

          
            wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//*[contains(.,'" + msg + "')]")));

            System.out.println("✅ PASS: Gửi & Hiển thị: " + msg);

        
            driver.navigate().refresh();

            wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.cssSelector("input[placeholder^='Tìm kiếm bệnh nhân']")));
            wait.until(ExpectedConditions.elementToBeClickable(
                    By.xpath("//div[normalize-space()='" + PATIENT_NAME + "']"))).click();

            wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//*[contains(.,'" + msg + "')]")));

            System.out.println("✅ PASS: Reload lại vẫn có.");

        } catch (TimeoutException te) {
            System.out.println("❌ TIMEOUT: Có thể login FAIL hoặc bị redirect.");
            System.out.println("➡ Current URL: " + driver.getCurrentUrl());
            te.printStackTrace();
        } catch (Exception e) {
            System.out.println("❌ FAIL: " + e.getMessage());
            System.out.println("➡ Current URL: " + driver.getCurrentUrl());
            e.printStackTrace();
        } finally {
            driver.quit();
        }
    }
}
