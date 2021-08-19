package com.example.demo;

import org.apache.camel.Exchange;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.component.kafka.KafkaConstants;
import org.apache.commons.dbcp2.BasicDataSource;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

@Component
public class DemoApplicationRouteBuilder extends RouteBuilder {

    public static final String TARGET_WITH_AUTH = "http:localhost:8080" +
            "/kie-server/services/rest/server/containers/Sample-DMN_1.0.0-SNAPSHOT/dmn" +
            "?authMethod=Basic&authUsername=kieserver&authPassword=kieserver1!&bridgeEndpoint=true";

    public static final String MODEL_NAMESPACE = "https://kiegroup.org/dmn/_5388429C-0B33-4FA1-95DD-FA7A69AF31E6";
    public static final String MODEL_NAME = "SampleDMN";

    DataSource datasource = setupDataSource();

    private static DataSource setupDataSource(){
        BasicDataSource ds = new BasicDataSource();
        ds.setUsername("postgres");
        ds.setDriverClassName("org.postgresql.Driver");
        ds.setPassword("password");
        ds.setUrl("jdbc:postgresql://localhost:5432/Data");
        return ds;
    }

    @Override
    public void configure() throws Exception {

        // Kafka Route for Reading from requestPool Topic
        from("kafka:requestPool?brokers=localhost:9092")
                .setHeader("requestKey", simple("${headers[kafka.KEY]}"))
                .log("\n${body}")
                .to("direct:postgreSQL");

        getContext().getRegistry().bind("datasource", datasource);

        // Create JSON Request from Kafka Message => Invoke API => Get Response => Write to PostgreSQL DB => Push Message to responsePool Kafka Topic
        from("direct:postgreSQL")
                .convertBodyTo(String.class)
                .to("freemarker:templates/requestObject.ftl")
                    .setHeader("modelNamespace", constant(MODEL_NAMESPACE))
                    .setHeader("modelName", constant(MODEL_NAME))
                .to("freemarker:templates/template.ftl")
                    .log("\n${body}")
                    .setHeader("Content-Type", constant("application/json"))
                    .setHeader("Accept", constant("application/json"))
                    .setHeader(Exchange.HTTP_METHOD, constant("POST"))
                    .removeHeader(Exchange.HTTP_PATH)
                .to(TARGET_WITH_AUTH)
                    .split().jsonpath("result.dmn-evaluation-result.decision-results[*].result")
                    .convertBodyTo(String.class)
                .to("kafka:responsePool?brokers=localhost:9092")
                    .setHeader(KafkaConstants.KEY, simple("${headers.requestKey}"))
                    .log("\n${body}")
                    .setBody(simple("INSERT INTO dataresults (output, date) VALUES ('${body}', '${date:now}')"))
                .to("jdbc:datasource")
                    .log("\n${body}")
                .to("mock:kafkaTest");

    }
}