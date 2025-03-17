package com.ttabong.connection;

import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@SpringBootTest
@ExtendWith(SpringExtension.class)
public class RabbitMQConnectionTest {
/*
    @Autowired
    private RabbitTemplate rabbitTemplate;

    private final String testQueue = "testQueue";

    @Test
    public void testRabbitMQConnection() {
        String message = "Hello, RabbitMQ!";

        // ✅ 큐가 존재하지 않아도 자동으로 생성되도록 설정
        rabbitTemplate.convertAndSend(testQueue, message);

        // ✅ 메시지 수신 대기 (재시도)
        String receivedMessage = null;
        for (int i = 0; i < 5; i++) {
            receivedMessage = (String) rabbitTemplate.receiveAndConvert(testQueue);
            if (receivedMessage != null) {
                break;
            }
            try {
                Thread.sleep(500);
            } catch (InterruptedException ignored) {}
        }

        assertNotNull(receivedMessage, "❌ 메시지를 수신하지 못했습니다.");
        assertEquals(message, receivedMessage, "❌ 수신된 메시지가 일치하지 않습니다.");

        System.out.println("✅ RabbitMQ 연결 성공! 메시지 전송 및 수신 완료");
    }

 */
}
