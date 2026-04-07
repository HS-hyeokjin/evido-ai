package com.evido.api.document.infrastructure.repository;

import com.evido.api.document.entity.FileObject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface FileObjectRepository extends JpaRepository<FileObject, Long> {

    List<FileObject> findByFileIdIn(Collection<Long> fileIds);

}
