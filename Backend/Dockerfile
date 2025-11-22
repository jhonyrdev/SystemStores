
FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
COPY src ./src

RUN chmod +x mvnw
RUN ./mvnw -q -DskipTests package

RUN cp target/*.jar backend-0.0.1-SNAPSHOT.jar

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=cloud

ENTRYPOINT ["java", "-jar", "backend-0.0.1-SNAPSHOT.jar"]
