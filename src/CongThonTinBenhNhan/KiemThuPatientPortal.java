package CongThonTinBenhNhan;
import java.io.File;
import java.time.Duration;
import java.util.List;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import Initialization.Init;

public class KiemThuPatientPortal extends Init {

	public static void main(String[] args) throws InterruptedException {
		//Kiểm thử trường hợp không có dữ liệu lịch sử khám
		SetUp("edge");
		driver.get("http://localhost:3000/login");

		driver.findElement(By.cssSelector("input[placeholder='vd: patient01@hospital.local']")).click();

		driver.findElement(By.cssSelector("input[placeholder='vd: patient01@hospital.local']"))
				.sendKeys("lego@gmail.com");

		driver.findElement(By.xpath("//input[@placeholder='••••••••']")).click();
		driver.findElement(By.xpath("//input[@placeholder='••••••••']")).sendKeys("09876543");
		Thread.sleep(2000);
		driver.findElement(By.xpath("//button[contains(text(),'Đăng nhập')]")).click();
		Thread.sleep(2000);
		driver.findElement(By.xpath("//a[@href='/visits']//div//div[contains(text(),'0')]")).click();
		
		Thread.sleep(2000);
		
		List<WebElement> messages = driver.findElements(
		        By.xpath("//*[contains(text(),'Bạn chưa có lịch sử khám bệnh nào.')]")
		);

		if (messages.size() > 0) {
		    System.out.println("TEST PASSED: Đã tìm thấy thông báo.");
		} else {
		    System.out.println("TEST FAILED: Không tìm thấy thông báo.");
		}

		/*
		WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

		WebElement message = wait.until(ExpectedConditions
				.visibilityOfElementLocated(By.xpath("//p[contains(text(),'Bạn chưa có lịch sử khám bệnh nào.')]")));

		String actualText = message.getText();

		assert actualText.equals("Bạn chưa có lịch sử khám bệnh nào.");
		System.out.println("TEST PASSED: Có xuất hiện thông báo không có lịch sử khám bệnh.");
		*/
		
		Thread.sleep(2000);
		driver.findElement(By.xpath("//button[contains(text(),'Trang chủ')]")).click();
		
		driver.findElement(By.xpath("//button[contains(text(),'Đăng xuất')]")).click();
		Thread.sleep(2000);
	//Kiểm thử trường hợp có dữ liệu lịch sử khám

		driver.findElement(By.cssSelector("input[placeholder='vd: patient01@hospital.local']")).click();

		driver.findElement(By.cssSelector("input[placeholder='vd: patient01@hospital.local']"))
				.sendKeys("hiepcc22");

		driver.findElement(By.xpath("//input[@placeholder='••••••••']")).click();
		driver.findElement(By.xpath("//input[@placeholder='••••••••']")).sendKeys("anhhiepdz");
		Thread.sleep(2000);
		driver.findElement(By.xpath("//button[contains(text(),'Đăng nhập')]")).click();
		Thread.sleep(2000);
		driver.findElement(By.xpath("//div[normalize-space()='4']")).click();
		Thread.sleep(2000);
		WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

		WebElement table = wait.until(ExpectedConditions.visibilityOfElementLocated(
		        By.xpath("//table[@class='visit-table']")
		));

		System.out.println("TEST PASSED: Bảng lịch sử khám bệnh đã hiển thị.");

		List<WebElement> rows = driver.findElements(By.xpath("//table/tbody/tr"));

		int numberOfRows = rows.size();

		if (numberOfRows == 4) {
		    System.out.println("TEST PASSED: Bảng thông tin hiển thị đúng 4 lần khám.");
		} else {
		    System.out.println("TEST FAILED: Số dòng hiển thị = " + numberOfRows + ", mong đợi = 4");
		}

		Thread.sleep(2000);
		
		driver.findElement(By.xpath("//tbody/tr[1]/td[6]/button[1]")).click();
		WebDriverWait wait2 = new WebDriverWait(driver, Duration.ofSeconds(10));

		WebElement modal = wait2.until(ExpectedConditions.visibilityOfElementLocated(
		        By.xpath("//h3[contains(text(),'Chi tiết hồ sơ khám')]")
		));

		System.out.println("TEST PASSED: Model chi tiết hồ sơ khám đã hiển thị.");

		Thread.sleep(2000);
		
		driver.findElement(By.xpath("//button[normalize-space()='×']")).click();
		
		driver.findElement(By.xpath("//button[contains(text(),'Trang chủ')]")).click();
		
		Thread.sleep(2000);
		
		//Kiểm thử trường hợp không có tài liệu PDF
		driver.findElement(By.xpath("//div[normalize-space()='4']")).click();
		
		driver.findElement(By.xpath("//tbody/tr[1]/td[6]/button[1]")).click();
		

		WebElement noPdfText = driver.findElement(
		    By.xpath("//p[contains(text(),'Chưa có tài liệu PDF cho lần khám này.')]")
		);

		if (noPdfText.isDisplayed()) {
		    System.out.println("TEST PASSED: Hiển thị đúng thông báo không có tài liệu PDF.");
		} else {
		    System.out.println("TEST FAILED: Không thấy thông báo 'Chưa có tài liệu PDF cho lần khám này.'");
		}
		
		driver.findElement(By.xpath("//button[normalize-space()='×']")).click();
		
		
		//Kiểm thử trường hợp "Xem PDF"

		driver.findElement(By.xpath("//tbody/tr[2]/td[6]/button[1]")).click();
		
		WebElement xemPDFBtn = wait.until(ExpectedConditions.elementToBeClickable(
			    By.xpath("//button[normalize-space()='Xem PDF']")
			));

			xemPDFBtn.click();
			System.out.println("Đã click nút Xem PDF.");

			
			WebElement pdfModal = wait.until(ExpectedConditions.visibilityOfElementLocated(
				    By.xpath("//h3[contains(text(),'Xem tài liệu PDF')]")
				));

				System.out.println("TEST PASSED: Popup Xem tài liệu PDF hiển thị thành công.");

		Thread.sleep(2000);
		
		driver.findElement(By.xpath("//div[3]//div[1]//div[1]//button[1]")).click();
		
		Thread.sleep(2000);
		
		
		
		//Kiểm thử trường hợp tải PDF
		// Click nút "Tải PDF"
        WebElement taiPdf = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Tải PDF')]")
        ));

        taiPdf.click();
        System.out.println("Đã click nút Tải PDF");
		
        String downloadFolder = "C:\\Users\\zb\\Downloads"; 
        String expectedFileNamePart = "X-quang phổi";  

        boolean isDownloaded = false;
        int attempts = 0;

        while (attempts < 15) {  // chờ tối đa 15 giây
            if (isFileDownloaded(downloadFolder, expectedFileNamePart)) {
                isDownloaded = true;
                break;
            }
            Thread.sleep(1000);
            attempts++;
        }

       
        if (isDownloaded) {
            System.out.println("TEST PASSED: File PDF đã tải thành công!");
        } else {
            System.out.println("TEST FAILED: Không thấy file PDF tải về!");
        }

        
        driver.findElement(By.xpath("//button[normalize-space()='×']")).click();
        
        Thread.sleep(2000);
		
		
		// Kiểm thử trường hợp xem PDF báo lỗi vì lý do định dạng hoặc chưa kịp đẩy file PDF lên hệ thống
		
        driver.findElement(By.xpath("//tbody/tr[4]/td[6]/button[1]")).click();
        
        Thread.sleep(2000);
        
     
        WebElement xemPdfLoi = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//li[contains(., '20/11/2025')]//button[contains(text(),'Xem PDF')]")     // nút thuộc dòng lỗi
        ));
        xemPdfLoi.click();
        System.out.println("Đã click nút Xem PDF.");

       
        try {
            Alert alert = wait.until(ExpectedConditions.alertIsPresent());
            String alertText = alert.getText();

            System.out.println("Thông báo xuất hiện: " + alertText);

            
            if (alertText.contains("Không xem được PDF")) {
                System.out.println("TEST PASSED: Hiển thị đúng thông báo lỗi khi PDF không tồn tại");
            } else {
                System.out.println("TEST FAILED: Nội dung cảnh báo không đúng!");
            }

            
            alert.accept();
            System.out.println("Alert đã được đóng.");

        } catch (Exception e) {
            System.out.println("TEST FAILED: Không xuất hiện alert khi PDF lỗi.");
        }
        
        
        Thread.sleep(2000);
        
        
        
     // Kiểm thử trường hợp tải PDF báo lỗi vì lý do định dạng hoặc chưa kịp đẩy file PDF lên hệ thống
     
        WebElement taiPdfLoi = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//li[contains(., '20/11/2025')]//button[contains(text(),'Tải PDF')]")     // nút thuộc dòng lỗi
        ));
        taiPdfLoi.click();
        System.out.println("Đã click nút Tải PDF.");

       
        try {
            Alert alert = wait.until(ExpectedConditions.alertIsPresent());
            String alertText = alert.getText();

            System.out.println("Thông báo xuất hiện: " + alertText);

            
            if (alertText.contains("Không tải được PDF")) {
                System.out.println("TEST PASSED: Hiển thị đúng thông báo lỗi khi không thể tải PDF");
            } else {
                System.out.println("TEST FAILED: Nội dung cảnh báo không đúng!");
            }

            
            alert.accept();
            System.out.println("Alert đã được đóng.");

        } catch (Exception e) {
            System.out.println("TEST FAILED: Không xuất hiện alert khi PDF lỗi.");
        }
        
        Thread.sleep(2000);
        
        
        
        
        
      
	

		
		driver.findElement(By.xpath("//button[contains(text(),'Đăng xuất')]")).click();
		
		
		
	}
	
	  public static boolean isFileDownloaded(String folderPath, String partialName) {
          File dir = new File(folderPath);

          File[] files = dir.listFiles();
          if (files == null || files.length == 0) {
              return false;
          }

          for (File file : files) {
              if (file.getName().contains(partialName)) {
                  return true;
              }
          }
          return false;
      }

}





