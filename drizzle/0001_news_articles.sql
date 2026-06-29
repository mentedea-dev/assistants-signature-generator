CREATE TABLE `news_articles` (
`id` int AUTO_INCREMENT NOT NULL,
`title` varchar(200) NOT NULL,
`excerpt` varchar(500) NOT NULL,
`content` text NOT NULL,
`tag` varchar(50) NOT NULL,
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `news_articles_id` PRIMARY KEY(`id`)
);
