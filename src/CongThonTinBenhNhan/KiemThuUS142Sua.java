package CongThonTinBenhNhan;

import org.openqa.selenium.By;

import Initialization.Init;

public class KiemThuUS142Sua extends Init {

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

		driver.findElement(By.xpath("//*[@id=\\\"root\\\"]/div/div/div[1]/a[2]/div")).click();
		Thread.sleep(2000);
		
		driver.findElement(By.xpath("//tbody/tr[1]/td[6]/div[1]/button[1]")).click();
		
		
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[2]/input")).click();
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[1]/div[2]/input")).sendKeys("C1, C2");
		
		driver.findElement(By.xpath("//*[@id=\"root\"]/div/div[2]/div/div[2]/div[2]/button[2]")).click();
		
		 System.out.println("TEST PASS: Sửa thông tin thành công");
		

	}

}
