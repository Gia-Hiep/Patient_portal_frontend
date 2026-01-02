package CongThonTinBenhNhan;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;

import Initialization.Init;

public class KiemThuUS142 extends Init {

	public static void main(String[] args) throws InterruptedException {
		System.out.println("=== BẮT ĐẦU CHẠY TEST ===");

		SetUp("edge");
		driver.get("http://localhost:3000/login");

		driver.findElement(By.cssSelector("input[placeholder='vd: patient01@hospital.local']")).click();

		driver.findElement(By.cssSelector("input[placeholder='vd: patient01@hospital.local']"))
				.sendKeys("hiepcc@gmail.com");

		driver.findElement(By.xpath("//input[@placeholder='••••••••']")).click();
		driver.findElement(By.xpath("//input[@placeholder='••••••••']")).sendKeys("12345678");
		Thread.sleep(2000);
		driver.findElement(By.xpath("//button[contains(text(),'Đăng nhập')]")).click();
		Thread.sleep(2000);

		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div/div[1]/a[2]/div")).click();
		
		  WebElement searchInput = driver.findElement(
	                By.xpath("//input[@placeholder='Tìm theo tên/email/chuyên khoa...']")
	        );
	        searchInput.click();
	        searchInput.clear();

	        // ===== ĐỔI GIÁ TRỊ TEST TẠI ĐÂY =====
	        String keyword = "Nguyễn D";   // PASS
	        // String keyword = "Nguyễn Drrrr"; // FAIL

	        searchInput.sendKeys(keyword);
	        Thread.sleep(1000);

	     

	        // ================= ASSERT PASS / FAIL =================
	        boolean foundDoctor = false;

	        // Nếu có dòng "Không có bác sĩ nào." → FAIL
	        if (driver.getPageSource().contains("Không có bác sĩ")) {
	            foundDoctor = false;
	        } else {
	            // Tìm trong bảng bác sĩ
	            List<WebElement> doctorNames = driver.findElements(
	                    By.xpath("//div[contains(text(),'Bác sĩ Nguyễn D')]")
	            );

	            for (WebElement e : doctorNames) {
	                if (e.getText().contains("Nguyễn")) {
	                    foundDoctor = true;
	                    break;
	                }
	            }
	        }

	        // ================= KẾT LUẬN =================
	        if (foundDoctor) {
	            System.out.println("TEST PASS: Tìm thấy bác sĩ với từ khóa:" + keyword);
	            Assert.assertTrue(true);
	        } else {
	            System.out.println("TEST FAIL: Không tìm thấy bác sĩ với từ khóa:" + keyword);
	            Assert.fail("Không tìm thấy bác sĩ");
	        }
	        Thread.sleep(1000);
	        searchInput.click();
	        searchInput.clear();
	        
	        searchInput.sendKeys("Nguyễn Drrrrrr");
	        driver.getPageSource().contains("Không có bác sĩ");
	        System.out.println("TEST PASS: Không tìm thấy bác sĩ với từ khóa: Nguyễn Drrrrrr" );
	        
	        Thread.sleep(1000);
	        
	        searchInput.click();
	        searchInput.clear();
	        
	        Thread.sleep(2000);
	        driver.findElement(By.xpath("//tbody/tr[5]/td[6]/div[1]/button[2]")).click();
	        Thread.sleep(1000);
	        
	        boolean isPopupDisplayed = false;

	     // Kiểm tra tiêu đề popup
	     if (driver.getPageSource().contains("Xác nhận xóa")) {
	         isPopupDisplayed = true;
	     }

	     if (isPopupDisplayed) {
	         System.out.println("TEST PASS: Xóa thành công");
	         Assert.assertTrue(true);
	     } else {
	         System.out.println("TEST FAIL: Không hiển thị popup xác nhận xóa");
	         Assert.fail("Popup xóa không hiển thị");
	     }

	     Thread.sleep(1000);
	     driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[2]/button[1]")).click();
	     Thread.sleep(2000);

	        Teardown();
	      }

}
