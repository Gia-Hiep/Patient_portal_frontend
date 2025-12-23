package us8;

import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.*;

import java.time.Duration;
import java.util.List;

public class PatientChatTest {

    static WebDriver driver;
    static WebDriverWait wait;

    static final String BASE_URL = "http://localhost:3000";
    static final String USERNAME = "hiepcc22";
    static final String PASSWORD = "anhhiepdz";
    static final String DOCTOR_NAME = "BS. Lê Văn C";

    static String sentMessage;

    public static void main(String[] args) {
        try {
            setup();
            login();
            openChat();
            selectDoctorAndWaitChatReady();
            sendMessageAndVerify();
            reloadAndVerify();
            System.out.println("🎉 US8 TEST PASSED 100%");
        } catch (Exception e) {
            System.out.println("❌ TEST FAILED");
            e.printStackTrace();
        } finally {
            // driver.quit();
        }
    }

    static void setup() {
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(35));
    }

    static void login() {
        driver.get(BASE_URL + "/login");

        WebElement usernameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("input[autocomplete='username']")));
        WebElement passwordInput = driver.findElement(By.cssSelector("input[type='password']"));

        usernameInput.clear();
        usernameInput.sendKeys(USERNAME);

        passwordInput.clear();
        passwordInput.sendKeys(PASSWORD);

        driver.findElement(By.cssSelector("button[type='submit']")).click();

        wait.until(ExpectedConditions.urlContains("/dashboard"));
        System.out.println("✅ Đăng nhập thành công. URL hiện tại: " + driver.getCurrentUrl());
    }

    static void openChat() {
        driver.get(BASE_URL + "/chat");
        wait.until(ExpectedConditions.urlContains("/chat"));
        System.out.println("✅ Đã điều hướng đến /chat");
    }

    static void selectDoctorAndWaitChatReady() {
        WebElement selectEl = wait.until(ExpectedConditions.presenceOfElementLocated(By.tagName("select")));
        new Select(selectEl).selectByVisibleText(DOCTOR_NAME);
        System.out.println("✅ Đã chọn bác sĩ: " + DOCTOR_NAME);

        wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[normalize-space()='Gửi']")));

        wait.until(d -> findMessageInput() != null);

        System.out.println("✅ Giao diện trò chuyện đã sẵn sàng (hộp gửi tin nhắn hiển thị)");
    }

    static void sendMessageAndVerify() {
        sentMessage = "US8_AUTO_" + System.currentTimeMillis() + " - Patient gửi tin";

        WebElement input = wait.until(d -> {
            WebElement el = findMessageInput();
            if (el == null) return null;
            try {
                return (el.isDisplayed() && el.isEnabled()) ? el : null;
            } catch (StaleElementReferenceException e) {
                return null;
            }
        });

        input.click();
        input.sendKeys(Keys.chord(Keys.CONTROL, "a"));
        input.sendKeys(Keys.BACK_SPACE);
        input.sendKeys(sentMessage);

        WebElement sendBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[normalize-space()='Gửi']")));
        sendBtn.click();

        wait.until(ExpectedConditions.presenceOfElementLocated(
                By.xpath("//*[contains(normalize-space(), '" + sentMessage + "')]")));

        System.out.println("✅ PASS: Đã gửi & hiển thị tin nhắn: " + sentMessage);
    }

    static void reloadAndVerify() {
        driver.navigate().refresh();
        wait.until(ExpectedConditions.urlContains("/chat"));

        try {
            WebElement selectEl = wait.until(ExpectedConditions.presenceOfElementLocated(By.tagName("select")));
            new Select(selectEl).selectByVisibleText(DOCTOR_NAME);
        } catch (Exception ignored) {}

        wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[normalize-space()='Gửi']")));

        wait.until(ExpectedConditions.presenceOfElementLocated(
                By.xpath("//*[contains(normalize-space(), '" + sentMessage + "')]")));

        System.out.println("✅ PASS: Reload lại và có tin nhắn");
    }

    static WebElement findMessageInput() {
        // 1) đúng placeholder bạn gửi trong ảnh
        List<WebElement> els1 = driver.findElements(By.cssSelector("input[placeholder='Nhập tin nhắn...']"));
        WebElement visible1 = firstVisible(els1);
        if (visible1 != null) return visible1;

        List<WebElement> els2 = driver.findElements(By.cssSelector("input[placeholder^='Nhập tin nhắn']"));
        WebElement visible2 = firstVisible(els2);
        if (visible2 != null) return visible2;

        List<WebElement> els3 = driver.findElements(By.xpath("//button[normalize-space()='Gửi']/preceding::input[1]"));
        WebElement visible3 = firstVisible(els3);
        if (visible3 != null) return visible3;

        return null;
    }

    static WebElement firstVisible(List<WebElement> els) {
        for (WebElement e : els) {
            try {
                if (e != null && e.isDisplayed() && e.isEnabled()) return e;
            } catch (Exception ignored) {}
        }
        return null;
    }
}
