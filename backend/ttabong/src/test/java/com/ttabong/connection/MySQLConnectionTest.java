package com.ttabong.connection;

import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
public class MySQLConnectionTest {
/*
    @Autowired
    private DataSource dataSource;

    @Test
    public void testMySQLConnection() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            assertNotNull(connection);
            System.out.println("MySQL 연결 성공");
        }
    }

 */
}
